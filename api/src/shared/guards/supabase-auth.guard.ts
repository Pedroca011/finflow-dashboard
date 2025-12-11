import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { supabase } from '../core/infra/supabase/supabase.client';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader)
      throw new UnauthorizedException('Missing authorization header');

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('Invalid token.');

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user)
      throw new UnauthorizedException('Invalid or expired token.');

    request.user = data.user;
    return true;
  }
}
