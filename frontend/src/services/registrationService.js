import apiClient from "./apiClient";

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

const simulateResponse = (data, delay = 950) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(data)), delay);
  });

export const submitRegistration = async (payload) => {
  if (useMockApi) {
    return simulateResponse({
      confirmationCode: `EV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      status: "confirmed",
      ...payload
    });
  }

  const { data } = await apiClient.post("/registrations", payload);
  return data;
};
