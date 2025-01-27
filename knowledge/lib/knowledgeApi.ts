import axios from "axios";

import {
  ResponseAutocompleteFilter,
  ResponseAutocompleteProcessedReferencesFilter,
  ResponseAutocompleteTags
} from "../src/knowledgeTypes";

export const getTagsAutocomplete = async (tagName: string): Promise<ResponseAutocompleteTags> => {
  const response = await axios.get("/api/tagsAutocomplete", { params: { q: tagName } });
  return response.data;
};

export const getInstitutionsAutocomplete = async (institutionName: string): Promise<ResponseAutocompleteFilter> => {
  const response = await axios.get("/api/institutionsAutocomplete", { params: { q: institutionName } });
  return response.data;
};

export const getContributorsAutocomplete = async (contributorName: string): Promise<ResponseAutocompleteFilter> => {
  const response = await axios.get("/api/contributorsAutocomplete", { params: { q: contributorName } });
  return response.data;
};

export const getReferencesAutocomplete = async (
  referenceSearch: string
): Promise<ResponseAutocompleteProcessedReferencesFilter> => {
  const response = await axios.get("/api/referencesAutocomplete", { params: { q: referenceSearch } });
  return response.data;
};
