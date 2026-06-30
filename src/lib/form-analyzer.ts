type FormFindingLevel = "critical" | "high" | "medium" | "low";

type FormFinding = {
  title: string;
  desc: string;
  level: FormFindingLevel;
  icon: string;
  category: "forms";
  solution: string;
  causes: string[];
  affectedPages: string[];
  affectedCount: number;
};

type FormPageResult = {
  path: string;
  score: number;
  critical: number;
  warning: number;
  check: string;
};

type FormAnalyzeOptions = {
  selectedPages?: string[];
};

type SinglePageFormResult = {
  url: string;
  path: string;
  score: number;
  findings: FormFinding[];
  page: FormPageResult;
};

export async function analyzeForms(
  url: string,
  options: FormAnalyzeOptions = {},
) {
  const baseUrl = normalizeUrl(url);
  const targetUrls = buildTargetUrls(baseUrl, options.selectedPages);

  const pageResults = await Promise.all(
    targetUrls.map((targetUrl, index) => analyzeFormPage(targetUrl, index)),
  );

  const findings = mergeFindings(pageResults);
  const pages = pageResults.map((result) => result.page);

  const score = pages.length
    ? Math.round(
        pages.reduce((total, page) => total + page.score, 0) / pages.length,
      )
    : 0;

  return {
    score,
    findings,
    pages,
  };
}

async function analyzeFormPage(
  url: string,
  index: number,
): Promise<SinglePageFormResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; PrecheckAI/1.0; +https://precheck.ai)",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Form analizi başarısız oldu. HTTP ${response.status}`);
  }

  const html = await response.text();
  const findings = analyzeHtmlForms(html);
  const score = calculateFormScore(findings);
  const path = getPathFromUrl(url);

  return {
    url,
    path,
    score,
    findings,
    page: {
      path,
      score,
      critical: findings.filter(
        (finding) => finding.level === "critical" || finding.level === "high",
      ).length,
      warning: findings.filter(
        (finding) => finding.level === "medium" || finding.level === "low",
      ).length,
      check: buildTimeLabel(index),
    },
  };
}

function analyzeHtmlForms(html: string) {
  const findings: FormFinding[] = [];

  const formMatches = html.match(/<form\b[^>]*>[\s\S]*?<\/form>/gi) ?? [];
  const inputMatches = html.match(/<input\b[^>]*>/gi) ?? [];
  const textareaMatches =
    html.match(/<textarea\b[^>]*>[\s\S]*?<\/textarea>/gi) ?? [];
  const selectMatches =
    html.match(/<select\b[^>]*>[\s\S]*?<\/select>/gi) ?? [];
  const buttonMatches =
    html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? [];

  const fieldMatches = [...inputMatches, ...textareaMatches, ...selectMatches];

  const textLikeInputs = inputMatches.filter((input) => {
    const type = getInputType(input);

    return ![
      "hidden",
      "submit",
      "button",
      "reset",
      "checkbox",
      "radio",
      "file",
      "image",
    ].includes(type);
  });

  const inputsWithoutLabel = textLikeInputs.filter((input) => {
    return !hasAccessibleLabel(input, html);
  });

  const inputsWithoutAutocomplete = textLikeInputs.filter((input) => {
    return !matchAttrFromTag(input, "autocomplete");
  });

  const emailNameWrongType = inputMatches.filter((input) => {
    const type = getInputType(input);
    const nameValue = normalizeText(
      `${matchAttrFromTag(input, "name") ?? ""} ${
        matchAttrFromTag(input, "id") ?? ""
      } ${matchAttrFromTag(input, "placeholder") ?? ""}`,
    );

    return (
      type !== "email" &&
      (nameValue.includes("email") || nameValue.includes("e-posta"))
    );
  });

  const phoneNameWrongType = inputMatches.filter((input) => {
    const type = getInputType(input);
    const nameValue = normalizeText(
      `${matchAttrFromTag(input, "name") ?? ""} ${
        matchAttrFromTag(input, "id") ?? ""
      } ${matchAttrFromTag(input, "placeholder") ?? ""}`,
    );

    return (
      type !== "tel" &&
      (nameValue.includes("phone") ||
        nameValue.includes("telefon") ||
        nameValue.includes("tel"))
    );
  });

  const passwordWithoutAutocomplete = inputMatches.filter((input) => {
    const type = getInputType(input);

    return type === "password" && !matchAttrFromTag(input, "autocomplete");
  });

  const requiredWithoutDescription = fieldMatches.filter((field) => {
    const required = /\srequired(?:=["'][^"']*["'])?/i.test(field);
    if (!required) return false;

    const ariaDescribedBy = matchAttrFromTag(field, "aria-describedby");
    const title = matchAttrFromTag(field, "title");

    return !ariaDescribedBy && !title;
  });

  const textareaWithoutMaxlength = textareaMatches.filter((textarea) => {
    return !matchAttrFromTag(textarea, "maxlength");
  });

  const selectWithoutPlaceholder = selectMatches.filter((select) => {
    const hasPlaceholderOption =
      /<option\b[^>]*value=["']?["']?[^>]*>/i.test(select) ||
      /<option\b[^>]*disabled[^>]*selected/i.test(select);

    return !hasPlaceholderOption;
  });

  const submitButtons = [
    ...inputMatches.filter((input) => getInputType(input) === "submit"),
    ...buttonMatches.filter((button) => {
      const type = matchAttrFromTag(button, "type")?.toLowerCase() ?? "submit";

      return type === "submit";
    }),
  ];

  const duplicateIds = getDuplicateValues(
    fieldMatches
      .map((field) => matchAttrFromTag(field, "id"))
      .filter((value): value is string => Boolean(value)),
  );

  const duplicateNames = getDuplicateValues(
    fieldMatches
      .map((field) => matchAttrFromTag(field, "name"))
      .filter((value): value is string => Boolean(value)),
  );

  const checkboxRadioWithoutGroupLabel = inputMatches.filter((input) => {
    const type = getInputType(input);

    if (type !== "checkbox" && type !== "radio") return false;

    return !hasAccessibleLabel(input, html);
  });

  const fieldsWithAriaInvalidNoMessage = fieldMatches.filter((field) => {
    const ariaInvalid = matchAttrFromTag(field, "aria-invalid");

    if (ariaInvalid !== "true") return false;

    return !matchAttrFromTag(field, "aria-describedby");
  });

  const formsWithoutSubmit = formMatches.filter((form) => {
    return !/<button\b[^>]*(type=["']submit["'])?[^>]*>|<input\b[^>]+type=["']submit["'][^>]*>/i.test(
      form,
    );
  });

  const formsWithoutActionOrMethod = formMatches.filter((form) => {
    const action = matchAttrFromTag(form, "action");
    const method = matchAttrFromTag(form, "method");

    return !action || !method;
  });

  if (inputsWithoutLabel.length > 0) {
    findings.push(
      createFormFinding({
        title: "Label eksik form alanları",
        desc: `${inputsWithoutLabel.length} form alanında label, aria-label veya aria-labelledby bulunamadı.`,
        level: "high",
        icon: "form-input",
        solution:
          "Her input, textarea ve select için görünür label veya aria-label kullanın.",
        causes: [
          "Form alanları sadece placeholder ile açıklanmış olabilir.",
          "Input id değeri ile label for değeri eşleşmiyor olabilir.",
          "Form component’i erişilebilir label üretmiyor olabilir.",
        ],
      }),
    );
  }

  if (inputsWithoutAutocomplete.length > 0) {
    findings.push(
      createFormFinding({
        title: "Autocomplete eksik form alanları",
        desc: `${inputsWithoutAutocomplete.length} form alanında autocomplete attribute bulunamadı.`,
        level: "medium",
        icon: "form-input",
        solution:
          "Ad, e-posta, telefon ve adres gibi alanlarda uygun autocomplete değerleri kullanın.",
        causes: [
          "Tarayıcı otomatik doldurma deneyimi desteklenmiyor olabilir.",
          "Form component’i autocomplete değerini dışarıdan almıyor olabilir.",
          "Kullanıcı aynı bilgileri manuel girmek zorunda kalabilir.",
        ],
      }),
    );
  }

  if (emailNameWrongType.length > 0) {
    findings.push(
      createFormFinding({
        title: "E-posta alanında yanlış input type",
        desc: `${emailNameWrongType.length} e-posta benzeri alanda type='email' kullanılmamış.`,
        level: "medium",
        icon: "mail",
        solution:
          "E-posta alanlarında type='email' kullanarak mobil klavye ve tarayıcı validasyonunu iyileştirin.",
        causes: [
          "Input type varsayılan text bırakılmış olabilir.",
          "Mobil cihazlarda uygun e-posta klavyesi açılmayabilir.",
          "Tarayıcı yerleşik e-posta validasyonu çalışmayabilir.",
        ],
      }),
    );
  }

  if (phoneNameWrongType.length > 0) {
    findings.push(
      createFormFinding({
        title: "Telefon alanında yanlış input type",
        desc: `${phoneNameWrongType.length} telefon benzeri alanda type='tel' kullanılmamış.`,
        level: "low",
        icon: "phone",
        solution:
          "Telefon alanlarında type='tel' kullanarak mobil klavye deneyimini iyileştirin.",
        causes: [
          "Telefon alanı text input olarak bırakılmış olabilir.",
          "Mobil cihazlarda numerik/tel klavye açılmayabilir.",
          "Kullanıcı telefon numarasını daha zor girebilir.",
        ],
      }),
    );
  }

  if (passwordWithoutAutocomplete.length > 0) {
    findings.push(
      createFormFinding({
        title: "Password autocomplete eksik",
        desc: `${passwordWithoutAutocomplete.length} password alanında autocomplete değeri bulunamadı.`,
        level: "medium",
        icon: "lock",
        solution:
          "Login için autocomplete='current-password', kayıt için autocomplete='new-password' kullanın.",
        causes: [
          "Şifre yöneticileri alanı doğru tanıyamayabilir.",
          "Kullanıcı kayıt/giriş deneyimi zayıflayabilir.",
          "Tarayıcı güvenli otomatik doldurma önerileri çalışmayabilir.",
        ],
      }),
    );
  }

  if (requiredWithoutDescription.length > 0) {
    findings.push(
      createFormFinding({
        title: "Required alan açıklaması eksik",
        desc: `${requiredWithoutDescription.length} required alanda aria-describedby veya title açıklaması bulunamadı.`,
        level: "low",
        icon: "alert-circle",
        solution:
          "Zorunlu alanlarda hata veya yardımcı metni aria-describedby ile inputa bağlayın.",
        causes: [
          "Required alanların hata mesajı input ile ilişkilendirilmemiş olabilir.",
          "Kullanıcı hangi formatta veri gireceğini anlayamayabilir.",
          "Ekran okuyucular yardımcı metni okuyamayabilir.",
        ],
      }),
    );
  }

  if (textareaWithoutMaxlength.length > 0) {
    findings.push(
      createFormFinding({
        title: "Textarea maxlength eksik",
        desc: `${textareaWithoutMaxlength.length} textarea alanında maxlength bulunamadı.`,
        level: "low",
        icon: "text",
        solution:
          "Mesaj ve açıklama alanlarında mantıklı maxlength değeri kullanın ve kalan karakter bilgisini gösterin.",
        causes: [
          "Kullanıcı çok uzun içerik gönderebilir.",
          "Backend validasyonu ile frontend davranışı uyumsuz olabilir.",
          "Form gönderiminde beklenmeyen veri boyutu oluşabilir.",
        ],
      }),
    );
  }

  if (selectWithoutPlaceholder.length > 0) {
    findings.push(
      createFormFinding({
        title: "Select placeholder eksik",
        desc: `${selectWithoutPlaceholder.length} select alanında boş/disabled başlangıç seçeneği bulunamadı.`,
        level: "low",
        icon: "list",
        solution:
          "Select alanlarında 'Seçiniz' gibi disabled ve boş value içeren başlangıç seçeneği kullanın.",
        causes: [
          "İlk seçenek gerçek değer olarak otomatik seçiliyor olabilir.",
          "Kullanıcı seçim yapmadan form gönderebilir.",
          "Form verisi yanlış varsayılan değerle iletilebilir.",
        ],
      }),
    );
  }

  if (submitButtons.length === 0 && formMatches.length > 0) {
    findings.push(
      createFormFinding({
        title: "Submit butonu bulunamadı",
        desc: `${formMatches.length} form olmasına rağmen submit butonu tespit edilemedi.`,
        level: "medium",
        icon: "send",
        solution:
          "Her formda görünür ve semantik bir submit butonu kullanın.",
        causes: [
          "Form gönderimi JavaScript ile farklı bir element üzerinden yapılıyor olabilir.",
          "Klavye kullanıcıları formu beklenen şekilde gönderemeyebilir.",
          "Enter ile submit davranışı çalışmayabilir.",
        ],
      }),
    );
  }

  if (duplicateIds.length > 0) {
    findings.push(
      createFormFinding({
        title: "Tekrarlanan form id değerleri",
        desc: `${duplicateIds.length} farklı form id değeri birden fazla kullanılmış.`,
        level: "medium",
        icon: "code",
        solution:
          "Input id değerlerini benzersiz yapın ve label for bağlantılarını doğru eşleştirin.",
        causes: [
          "Aynı form component’i sabit id ile tekrar render ediliyor olabilir.",
          "Label yanlış input alanına bağlanabilir.",
          "JavaScript validasyonları yanlış alanı hedefleyebilir.",
        ],
      }),
    );
  }

  if (duplicateNames.length > 0) {
    findings.push(
      createFormFinding({
        title: "Tekrarlanan form name değerleri",
        desc: `${duplicateNames.length} farklı form name değeri birden fazla kullanılmış.`,
        level: "low",
        icon: "code",
        solution:
          "Aynı veri grubuna ait değilse name değerlerini benzersiz ve açıklayıcı yapın.",
        causes: [
          "Form gönderiminde alan değerleri çakışabilir.",
          "Backend aynı name ile gelen birden fazla değeri yanlış işleyebilir.",
          "Analytics veya tracking alan ayrımını doğru yapamayabilir.",
        ],
      }),
    );
  }

  if (checkboxRadioWithoutGroupLabel.length > 0) {
    findings.push(
      createFormFinding({
        title: "Checkbox/radio label eksik",
        desc: `${checkboxRadioWithoutGroupLabel.length} checkbox/radio alanında erişilebilir label bulunamadı.`,
        level: "medium",
        icon: "check-square",
        solution:
          "Checkbox ve radio alanlarını label ile bağlayın. Grup için fieldset ve legend kullanın.",
        causes: [
          "Seçenekler sadece görsel işaretle sunulmuş olabilir.",
          "Kullanıcı hangi seçeneği işaretlediğini anlayamayabilir.",
          "Ekran okuyucu seçeneğin amacını okuyamayabilir.",
        ],
      }),
    );
  }

  if (fieldsWithAriaInvalidNoMessage.length > 0) {
    findings.push(
      createFormFinding({
        title: "aria-invalid hata mesajına bağlı değil",
        desc: `${fieldsWithAriaInvalidNoMessage.length} alanda aria-invalid=true var ancak aria-describedby yok.`,
        level: "medium",
        icon: "alert-circle",
        solution:
          "Hata mesajlarını aria-describedby ile ilgili inputa bağlayın.",
        causes: [
          "Input geçersiz olarak işaretlenmiş ama hata açıklaması ilişkilendirilmemiş olabilir.",
          "Ekran okuyucular hata sebebini okuyamayabilir.",
          "Form validasyon deneyimi eksik kalabilir.",
        ],
      }),
    );
  }

  if (formsWithoutSubmit.length > 0) {
    findings.push(
      createFormFinding({
        title: "Form içinde submit davranışı eksik",
        desc: `${formsWithoutSubmit.length} formda semantik submit butonu bulunamadı.`,
        level: "medium",
        icon: "send",
        solution:
          "Form içinde type='submit' olan button veya input kullanın.",
        causes: [
          "Form gönderimi click handler ile dışarıdan yapılıyor olabilir.",
          "Enter tuşu ile form gönderimi çalışmayabilir.",
          "Semantik form davranışı bozulmuş olabilir.",
        ],
      }),
    );
  }

  if (formsWithoutActionOrMethod.length > 0) {
    findings.push(
      createFormFinding({
        title: "Form action/method eksik",
        desc: `${formsWithoutActionOrMethod.length} formda action veya method attribute eksik.`,
        level: "low",
        icon: "file",
        solution:
          "JavaScript ile gönderim olsa bile form davranışını netleştirmek için method ve gerekirse action tanımlayın.",
        causes: [
          "Form tamamen client-side submit mantığına bırakılmış olabilir.",
          "Progressive enhancement desteği eksik olabilir.",
          "Formun gönderim davranışı HTML seviyesinde belirsiz kalabilir.",
        ],
      }),
    );
  }

  return findings;
}

function createFormFinding(
  finding: Omit<FormFinding, "category" | "affectedPages" | "affectedCount">,
): FormFinding {
  return {
    ...finding,
    category: "forms",
    affectedPages: [],
    affectedCount: 0,
  };
}

function mergeFindings(pageResults: SinglePageFormResult[]) {
  const map = new Map<string, FormFinding>();

  pageResults.forEach((result) => {
    result.findings.forEach((finding) => {
      const key = `${finding.title}-${finding.level}`;

      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          ...finding,
          affectedPages: [result.path],
          affectedCount: 1,
        });
        return;
      }

      if (!existing.affectedPages.includes(result.path)) {
        existing.affectedPages.push(result.path);
        existing.affectedCount = existing.affectedPages.length;
      }

      existing.causes = Array.from(
        new Set([...existing.causes, ...finding.causes]),
      );
    });
  });

  return Array.from(map.values());
}

function buildTargetUrls(baseUrl: string, selectedPages?: string[]) {
  const pages = selectedPages?.length ? selectedPages : ["/"];

  return Array.from(
    new Set(
      pages.map((page) => {
        if (page === "home" || page === "/home" || page === "/") {
          return baseUrl;
        }

        if (/^https?:\/\//i.test(page)) {
          return normalizeUrl(page);
        }

        const normalizedPath = page.startsWith("/") ? page : `/${page}`;

        return `${new URL(baseUrl).origin}${normalizedPath}`;
      }),
    ),
  );
}

function normalizeUrl(url: string) {
  const trimmed = url.trim();

  if (!trimmed) {
    throw new Error("URL boş olamaz.");
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/$/, "");
  }

  return `https://${trimmed}`.replace(/\/$/, "");
}

function getPathFromUrl(url: string) {
  const path = new URL(url).pathname;

  if (!path || path === "/") return "/";

  return path;
}

function getInputType(input: string) {
  return matchAttrFromTag(input, "type")?.toLowerCase() ?? "text";
}

function hasAccessibleLabel(field: string, html: string) {
  const id = matchAttrFromTag(field, "id");
  const ariaLabel = matchAttrFromTag(field, "aria-label");
  const ariaLabelledBy = matchAttrFromTag(field, "aria-labelledby");

  if (ariaLabel || ariaLabelledBy) return true;
  if (!id) return false;

  return new RegExp(`<label[^>]+for=["']${escapeRegExp(id)}["']`, "i").test(
    html,
  );
}

function getDuplicateValues(values: string[]) {
  return Array.from(
    new Set(values.filter((value, index) => values.indexOf(value) !== index)),
  );
}

function matchAttrFromTag(tag: string, attr: string) {
  const regex = new RegExp(`${attr}=["']([^"']*)["']`, "i");
  const match = tag.match(regex);

  if (!match) return null;

  return match[1].trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("İ", "i")
    .replaceAll("i̇", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .trim();
}

function calculateFormScore(findings: FormFinding[]) {
  let score = 100;

  findings.forEach((finding) => {
    if (finding.level === "critical") score -= 20;
    if (finding.level === "high") score -= 12;
    if (finding.level === "medium") score -= 7;
    if (finding.level === "low") score -= 3;
  });

  return Math.max(0, Math.min(100, score));
}

function buildTimeLabel(index: number) {
  const baseHour = 14;
  const baseMinute = 30 + index;

  return `Bugün ${String(baseHour).padStart(2, "0")}:${String(
    baseMinute,
  ).padStart(2, "0")}`;
}