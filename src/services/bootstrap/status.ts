export type BootstrapStatus = "idle" | "running" | "success" | "error";

export interface BootstrapState {
  status: BootstrapStatus;
  error?: string | null;
}

export const initialBootstrapState: BootstrapState = { status: "idle", error: null };

export default BootstrapState;
