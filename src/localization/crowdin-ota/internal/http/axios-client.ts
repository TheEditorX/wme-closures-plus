import axios from 'axios';
import { HttpClient } from '../../model';

export function createCrowdinAxiosClient(): HttpClient {
  const crowdinAxiosClient = axios.create();
  return {
    get: async (url: string) => (await crowdinAxiosClient.get(url)).data,
  };
}
