// Alternative MongoDB connection using Atlas Data API
// This doesn't require IP whitelisting

const ATLAS_DATA_API_URL = process.env.ATLAS_DATA_API_URL;
const ATLAS_DATA_API_KEY = process.env.ATLAS_DATA_API_KEY;
const DATABASE_NAME = process.env.DATABASE_NAME || "ayursutra";

export interface AtlasDataAPIResponse<T = any> {
  documents: T[];
  hasMore?: boolean;
  next?: string;
}

export class AtlasDataAPI {
  private baseUrl: string;
  private apiKey: string;
  private database: string;

  constructor() {
    if (!ATLAS_DATA_API_URL || !ATLAS_DATA_API_KEY) {
      console.warn("⚠️ Atlas Data API not configured. Using fallback mode.");
      this.baseUrl = "";
      this.apiKey = "";
      this.database = "";
    } else {
      this.baseUrl = ATLAS_DATA_API_URL;
      this.apiKey = ATLAS_DATA_API_KEY;
      this.database = DATABASE_NAME;
    }
  }

  private async makeRequest<T = any>(
    endpoint: string,
    method: string = "GET",
    body?: any
  ): Promise<AtlasDataAPIResponse<T>> {
    if (!this.baseUrl) {
      throw new Error("Atlas Data API not configured");
    }

    const response = await fetch(
      `${this.baseUrl}/app/data-${this.database}/endpoint/data/v1/action/${endpoint}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: body ? JSON.stringify(body) : null,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Atlas Data API error: ${response.status} ${await response.text()}`
      );
    }

    return response.json();
  }

  async find(collection: string, filter: any = {}, options: any = {}) {
    return this.makeRequest("find", "POST", {
      collection,
      database: this.database,
      filter,
      ...options,
    });
  }

  async findOne(collection: string, filter: any = {}) {
    const result = await this.find(collection, filter, { limit: 1 });
    return result.documents[0] || null;
  }

  async insertOne(collection: string, document: any) {
    return this.makeRequest("insertOne", "POST", {
      collection,
      database: this.database,
      document,
    });
  }

  async insertMany(collection: string, documents: any[]) {
    return this.makeRequest("insertMany", "POST", {
      collection,
      database: this.database,
      documents,
    });
  }

  async updateOne(collection: string, filter: any, update: any) {
    return this.makeRequest("updateOne", "POST", {
      collection,
      database: this.database,
      filter,
      update,
    });
  }

  async updateMany(collection: string, filter: any, update: any) {
    return this.makeRequest("updateMany", "POST", {
      collection,
      database: this.database,
      filter,
      update,
    });
  }

  async deleteOne(collection: string, filter: any) {
    return this.makeRequest("deleteOne", "POST", {
      collection,
      database: this.database,
      filter,
    });
  }

  async deleteMany(collection: string, filter: any) {
    return this.makeRequest("deleteMany", "POST", {
      collection,
      database: this.database,
      filter,
    });
  }
}

export const atlasAPI = new AtlasDataAPI();
