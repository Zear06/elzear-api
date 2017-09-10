import type { GraphQLResolveInfo } from 'graphql/type/definition';
import ApiError from '../../ApiError';

function secure(callback) {
  return function checkAuth(source?: any,
                            args?: { [argName: string]: any },
                            context?: any,
                            info?: GraphQLResolveInfo) {
    if (!context.req || !context.req.user || !context.req.user._key) {
      throw new ApiError(401, 'Unauthorized');
    }
    return callback(source, args, context, info);
  }
}

export default secure;
