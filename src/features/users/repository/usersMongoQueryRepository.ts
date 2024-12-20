import {userCollection} from "../../../db/mongo-db";
import {ObjectId, WithId} from "mongodb";
import {UserViewModel} from "../types/userViewModel";
import {UsersDbModel} from "../types/usersDbModel";
import {
    getPaginationAndSortOptions
} from "../../../utilities/paginationAndSorting/paginationAndSorting";
import {Paginator, SortingQueryField} from "../../../utilities/paginationAndSorting/paginator-type";
import {LoginSuccessViewModel} from "../../../utilities/jwtService/jwtModel";
import {MeViewModel} from "../../auth/authModel";

export const usersMongoQueryRepository = {
    async getAll(query: SortingQueryField): Promise<Paginator<UserViewModel[]>> {
        const processedQuery = getPaginationAndSortOptions(query);
        const filter: any = {$or: []} //todo: посмотреть типизацию.
        if (processedQuery.searchLoginTerm) {
            filter.$or.push({login: {$regex: processedQuery.searchLoginTerm, $options: 'i'}})
        }

        if (processedQuery.searchEmailTerm) {
            filter.$or.push({email: {$regex: processedQuery.searchEmailTerm, $options: 'i'}})
        }

        if (filter.$or.length === 0) {
            delete filter.$or
        }

        const users = await userCollection
            .find(filter)
            .sort(processedQuery.sortBy, processedQuery.sortDirection)
            .skip((processedQuery.pageNumber - 1) * processedQuery.pageSize)
            .limit(processedQuery.pageSize)
            .toArray()
        const totalCount = await userCollection.countDocuments(filter)
        const pagesCount = Math.ceil(totalCount / processedQuery.pageSize)
        return {
            'pagesCount': pagesCount,
            'page': processedQuery.pageNumber,
            'pageSize': processedQuery.pageSize,
            'totalCount': totalCount,
            'items': users.map(user => this._UserDTO(user))
        }
    },

    async findUserId(userId: string): Promise<UserViewModel | null> {
        if (!this._checkObjectId(userId)) return null
        let user = await userCollection.findOne({_id: new ObjectId(userId)})
        return user ? this._UserDTO(user) : null
    },

    async findUserIdDtoMe(userId: string): Promise<MeViewModel | null> {
        if (!this._checkObjectId(userId)) return null
        let user = await userCollection.findOne({_id: new ObjectId(userId)})
        return user ? this._meDTO(user) : null
    },

    async accessTokenDTO(jwt: string): Promise<LoginSuccessViewModel> {
        return {
            accessToken: jwt
        }
    },

    _UserDTO(user: WithId<UsersDbModel>): UserViewModel {
        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt
        }
    },

    _meDTO(user: WithId<UsersDbModel>): MeViewModel {
      return {
          email: user.email,
          login: user.login,
          userId: user._id.toString(),
      }
    },

    _checkObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    }

}
