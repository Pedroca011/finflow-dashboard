import axios from "axios";

const BRAPI_BASE_URL = "https://brapi.dev/api";

export interface BrapiQuote {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketDayRange: string;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: string;
  regularMarketOpen: number;
  regularMarketPreviousClose: number;
  regularMarketVolume: number;
  marketCap?: number;
  logourl?: string;
}

export interface BrapiStock {
  stock: string;
  name: string;
  close: number;
  change: number;
  volume: number;
  market_cap: number | null;
  logo: string;
  sector?: string;
}

export interface BrapiListResponse {
  stocks: BrapiStock[];
}

export interface BrapiQuoteResponse {
  results: BrapiQuote[];
}

export const brapiService = {
  // Lista todas as ações disponíveis
  async listStocks(): Promise<BrapiStock[]> {
    try {
      const response = await axios.get<BrapiListResponse>(
        `${BRAPI_BASE_URL}/quote/list`
      );
      return response.data.stocks || [];
    } catch (error) {
      console.error("Erro ao buscar lista de ações:", error);
      throw error;
    }
  },

  // Busca cotação de uma ou mais ações
  async getQuote(tickers: string | string[]): Promise<BrapiQuote[]> {
    try {
      const tickerString = Array.isArray(tickers) ? tickers.join(",") : tickers;
      const response = await axios.get<BrapiQuoteResponse>(
        `${BRAPI_BASE_URL}/quote/${tickerString}`
      );
      return response.data.results || [];
    } catch (error) {
      console.error("Erro ao buscar cotação:", error);
      throw error;
    }
  },

  // Busca dados históricos
  async getHistoricalData(ticker: string, range: string = "1mo") {
    try {
      const response = await axios.get(
        `${BRAPI_BASE_URL}/quote/${ticker}?range=${range}&interval=1d&fundamental=false`
      );
      return response.data.results?.[0]?.historicalDataPrice || [];
    } catch (error) {
      console.error("Erro ao buscar dados históricos:", error);
      throw error;
    }
  },
};
