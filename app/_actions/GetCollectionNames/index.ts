"use server";
import { VorionRAGSDK } from "vorion-sdk";

export async function GetCollectionNames() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const ragSdk = new VorionRAGSDK("https://rag.rise-consulting.net");
  const retrive = await ragSdk.retrieve({
    query: "",
    k: 10,
    collection_name: "vorion_sdk_youtube_transcripts",
    search_in_vectorstore: true,
    search_in_indexstore: true,
    search_result_count_for_vectorstore: 10,
    search_result_count_for_indexstore: 10,
    user_id: "vorion_sdk_test_user_1",
  });

  return retrive;
}
