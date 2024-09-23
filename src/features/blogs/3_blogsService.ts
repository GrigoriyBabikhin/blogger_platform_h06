import {BlogInputModel} from "../../input-output-types/blogs-types";
import {blogsMongoRepository} from "./repository/blogsMongoRepository";


export const blogsService = {
    async createBlog(blogInput: BlogInputModel): Promise<string | null> {
        return await blogsMongoRepository.createBlog(blogInput)
    },

    async updateBlog(blogId: string, blog: BlogInputModel): Promise<boolean> {
        return await blogsMongoRepository.updateBlog(blogId, blog)
    },

    async deleteBlog(blogId: string): Promise<boolean> {
        return await blogsMongoRepository.deleteBlog(blogId)
    },

    async deleteALL(): Promise<boolean> {
        return await blogsMongoRepository.deleteALL()
    },
}
