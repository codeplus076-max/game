import type { TopicTag } from "@/types/common";

export interface StudyTopic {
  id: string;
  title: string;
  summary: string;
  difficulty: "intro" | "intermediate" | "advanced";
  body: string;
  tags: TopicTag[];
}

export const starterStudyContent: StudyTopic[] = [
  {
    id: "s-phishing",
    title: "Recognizing Phishing Attempts",
    summary: "Learn how to spot phishing emails and social engineering attempts.",
    difficulty: "intro",
    body: "Phishing is a type of social engineering where attackers trick users into revealing credentials or installing malware. Look for suspicious sender addresses, mismatched links, urgent requests, and unexpected attachments. Verify unknown requests via a separate channel and enable email filtering and training.",
    tags: ["phishing", "social_engineering"],
  },
  {
    id: "s-malware",
    title: "Malware Basics",
    summary: "Understand malware types and prevention strategies.",
    difficulty: "intro",
    body: "Malware includes viruses, worms, trojans, and spyware. Keep systems patched, run endpoint protection, avoid unknown attachments, and use least-privilege accounts. Regular backups and network segmentation reduce impact.",
    tags: ["malware"],
  },
  {
    id: "s-ransomware",
    title: "Ransomware Resilience",
    summary: "How to reduce ransomware risk and recover quickly.",
    difficulty: "intermediate",
    body: "Ransomware encrypts files and demands payment. To mitigate: maintain offline/dedicated backups, keep systems patched, segment networks, restrict privileged access, and practice recovery drills. Use endpoint detection and block known attack vectors.",
    tags: ["ransomware", "backups"],
  },
  {
    id: "s-passwords",
    title: "Password Security",
    summary: "Best practices for managing passwords and secrets.",
    difficulty: "intro",
    body: "Use long, unique passwords or passphrases, store them in a password manager, and enable multi-factor authentication where possible. Avoid reuse and rotate credentials when exposure is suspected.",
    tags: ["password_security", "authentication"],
  },
  {
    id: "s-authentication",
    title: "Authentication & MFA",
    summary: "Why multi-factor authentication matters.",
    difficulty: "intermediate",
    body: "MFA adds a second form of verification (e.g., OTP, push, hardware token). Combine MFA with strong passwords and monitor for anomalous logins. Prioritize MFA for privileged accounts.",
    tags: ["authentication"],
  },
  {
    id: "s-encryption",
    title: "Encryption Fundamentals",
    summary: "Protecting data at rest and in transit.",
    difficulty: "intermediate",
    body: "Use strong encryption (TLS for transit, AES for storage) and manage keys securely. Encrypt backups and sensitive databases. Ensure proper certificate management and renewal.",
    tags: ["encryption"],
  },
  {
    id: "s-firewalls",
    title: "Firewalls and Network Controls",
    summary: "Using firewalls to reduce attack surface.",
    difficulty: "intro",
    body: "Firewalls control inbound/outbound traffic by rules. Minimize open ports, use least-privilege access, and monitor logs. Combine with IDS/IPS and network segmentation for defense-in-depth.",
    tags: ["firewalls", "network_security"],
  },
  {
    id: "s-patching",
    title: "Patch Management",
    summary: "Keeping systems updated to block exploits.",
    difficulty: "intermediate",
    body: "Implement a patch cadence, prioritize critical updates, and automate where possible. Test patches in staging, maintain an inventory of assets, and monitor CVE advisories.",
    tags: ["patching"],
  },
  {
    id: "s-backups",
    title: "Backup Best Practices",
    summary: "Designing robust backup strategies and recovery tests.",
    difficulty: "intermediate",
    body: "Keep multiple backup copies, use offsite/offline storage, encrypt backups, and regularly test restores. Track RTO/RPO objectives and document recovery procedures.",
    tags: ["backups"],
  },
  {
    id: "s-social",
    title: "Social Engineering",
    summary: "Recognizing manipulation techniques beyond phishing.",
    difficulty: "intro",
    body: "Social engineering uses persuasion to manipulate people into actions. Train users to verify identity, avoid sharing secrets, and report suspicious behavior. Use policies and simulated tests to improve awareness.",
    tags: ["social_engineering"],
  },
  {
    id: "s-safe-browsing",
    title: "Safe Browsing Habits",
    summary: "Reducing risk while browsing and downloading.",
    difficulty: "intro",
    body: "Use browser protections, avoid clicking unknown links, check URLs before entering credentials, and keep browser extensions minimal. Use content filtering and endpoint protections.",
    tags: ["safe_browsing"],
  },
  {
    id: "s-incident",
    title: "Incident Response Basics",
    summary: "What to do when a security incident occurs.",
    difficulty: "advanced",
    body: "Have a documented incident response plan, designate roles, preserve evidence, contain and eradicate threats, and communicate transparently. Post-incident reviews improve defenses.",
    tags: ["malware", "ransomware"],
  },
];

export default starterStudyContent;
