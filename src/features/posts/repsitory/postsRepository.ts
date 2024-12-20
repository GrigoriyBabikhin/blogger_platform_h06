import {postCollection} from "../../../db/mongo-db";
import {ObjectId} from "mongodb";
import {PostInputModel, PostsDbType} from "../post-type";

export const postsRepository = {
    async findPostById(postId: string){
        if(!this._checkObjectId(postId)) return null
        const post = await postCollection.findOne({_id: new ObjectId(postId)})
        return post ? post : null
    },

    async createPost(newPost: PostsDbType): Promise<string | null> {
        const createdPostId = await postCollection.insertOne(newPost)
        return createdPostId.insertedId ? createdPostId.insertedId.toString() : null
    },

    async updatePost(postId: string, post: PostInputModel): Promise<boolean> {
        const result = await postCollection.updateOne({_id: new ObjectId(postId)},
            {
                $set: {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: post.blogId
                }
            })
        return result.matchedCount === 1
    },

    async deletePost(postId: string): Promise<boolean> {
        const result = await postCollection.deleteOne({_id: new ObjectId(postId)})
        return result.deletedCount === 1
    },

    async deleteALLPosts() {
        return await postCollection.drop()
    },

    _checkObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    },
}
