import type { GraphQLResolveInfo, GraphQLFieldResolveFn } from 'graphql';
import type { Context } from 'koa';
import ApiError from '../../ApiError';

const secure: GraphQLFieldResolveFn = (callback) => {
  return function checkAuth(source?: any,
                            args?: { [argName: string]: any },
                            context: Context,
                            info?: GraphQLResolveInfo) {
    if (!context.req || !context.req.user || !context.req.user._key) {
      throw new ApiError(401, 'Unauthorized');
    }
    return callback(source, args, context, info);
  }
};

export default secure;
