import apiClient from "./client";

export const translationApi = {
  updateTranslationOverride: (model, id, lang, fields) =>
    apiClient.put(`/translations/${model}/${id}/${lang}`, { fields }),
};

export default translationApi;
