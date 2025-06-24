import { Client, Databases, ID, Query } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(PROJECT_ID)

const databases= new Databases(client);
export const updateSearchCount = async (searchTerm, anime) => {
    //1use appwrite sdk to verify if the search term exists already and incremente
    try{
        const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm),
        ])

        if(result.documents.length >0){
            const doc = result.documents[0];
            await databases.updateDocument(DATABASE_ID,COLLECTION_ID, doc.$id, {
                count: doc.count+1,
            } )
        }else{
            await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                anime_id: anime.mal_id,
                poster_url: anime.images?.jpg?.image_url,
            })
        }
    }catch(err){
        console.log(err)
    }
}

export const getTrendingAnimes = async()=> {
    try{
        const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count")
        ])
        return result.documents;
    }catch(error){
        console.log(error)
    }
}