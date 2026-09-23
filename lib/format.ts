export function getInitials(fullName: string | null, email?: string): string {
  if (fullName) {
    const initials = fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
    if (initials) return initials;
  }
  return email?.[0]?.toUpperCase() ?? "?";
}
