import { VorionRAGSDK } from 'vorion-sdk';

export async function Ingest() {
	const ragSdk = new VorionRAGSDK('https://rag.rise-consulting.net');

	const ingestResult = await ragSdk.ingest({
		data_sources: [
			{
				type: 'youtube',
				target: 'https://www.youtube.com/watch?v=gJmz31JywM0',
				parameters: {},
				metadata: {},
			},
		],
		embedder_name: 'azure',
		indexer_name: 'elasticsearch',
		vectorstore_name: 'chroma',
		collection_name: 'vorion_sdk_youtube_transcripts',
		embed_documents: true,
		index_documents: true,
		user_id: 'vorion_sdk_test_user_1',
		preferred_splitter_type: 'recursive',
		chunk_size: 1000,
		chunk_overlap: 200,
	});

	return ingestResult;
}