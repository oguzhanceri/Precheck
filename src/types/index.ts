export type StatusTone = "success" | "warning" | "danger" | "neutral" | "info";

export type NavItem = {
  label: string;
  href: string;
};

export type MetricItem = {
  label: string;
  value: string;
  change?: string;
  tone?: StatusTone;
};
