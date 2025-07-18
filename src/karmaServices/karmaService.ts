import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.API_KEY;
const url = "https://adjutor.lendsqr.com/v2/verification/karma";

export async function checkKarmaBlacklist(bvn: string): Promise<boolean> {
  if (!apiKey) {
    throw new Error("API_KEY is not defined in the environment variables.");
  }

  try {
    const { data } = await axios.get(`${url}/${bvn}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    console.log("Karma API response:", data);
    return data.blacklisted === true;
  } catch (error) {
    console.error("Error checking Karma blacklist:", (error as Error).message);
    throw new Error("Failed to check Karma blacklist");
  }
}
