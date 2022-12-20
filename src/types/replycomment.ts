import { CommentType } from "./comment";

export type ReplyCommentType = {
    _id?: number,
    author: string;
    avatar: string;
    content: string;
    datetime: string;
    createdAt: string;
    rating: number;
    userId: string;
    commentId: string | CommentType;
    postId:string,
    dayId:string,
    like: [
        {
            userId: string,
            status: string
        }
    ],
    dislike: [
        {
            userId: string,
            status: string
        }
    ],
    
}