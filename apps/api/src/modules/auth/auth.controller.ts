import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { AppleAuthGuard } from "./guards/apple-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "./types/authenticated-user.type";
import type { AuthResult, OAuthProfileInput, RequestMeta } from "./types/auth-result.type";

const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } }; // 5 attempts / minute

@ApiTags("auth")
@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: "Create a new account and send a verification email" })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Ip() ip: string,
  ): Promise<AuthResponseDto> {
    return this.authService.register(dto, this.buildMeta(req, ip));
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_THROTTLE)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: "Log in with email + password" })
  async login(
    @CurrentUser() user: AuthenticatedUser,
    @Body() _dto: LoginDto,
    @Req() req: Request,
    @Ip() ip: string,
  ): Promise<AuthResponseDto> {
    return this.authService.login(user, this.buildMeta(req, ip));
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Exchange a refresh token for a new access/refresh token pair" })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Ip() ip: string,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(dto.refreshToken, this.buildMeta(req, ip));
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Revoke a refresh token" })
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Return the currently authenticated user" })
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }

  @Post("verify-email")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Confirm an email address using the token from the verification email" })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<void> {
    await this.authService.verifyEmail(dto.token);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: "Request a password reset email" })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    await this.authService.forgotPassword(dto.email);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: "Set a new password using the token from the reset email" })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Start Google OAuth login" })
  googleAuth(): void {
    // Passport redirects to Google before this body ever runs.
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Google OAuth callback" })
  async googleCallback(
    @CurrentUser() profile: unknown,
    @Req() req: Request,
    @Res() res: Response,
    @Ip() ip: string,
  ): Promise<void> {
    const result = await this.authService.validateOAuthLogin(
      profile as OAuthProfileInput,
      this.buildMeta(req, ip),
    );
    this.redirectWithTokens(res, result);
  }

  @Get("apple")
  @UseGuards(AppleAuthGuard)
  @ApiOperation({ summary: "Start Apple OAuth login" })
  appleAuth(): void {
    // Passport redirects to Apple before this body ever runs.
  }

  @Post("apple/callback")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AppleAuthGuard)
  @ApiOperation({ summary: "Apple OAuth callback (Apple posts here via form_post)" })
  async appleCallback(
    @CurrentUser() profile: unknown,
    @Req() req: Request,
    @Res() res: Response,
    @Ip() ip: string,
  ): Promise<void> {
    const result = await this.authService.validateOAuthLogin(
      profile as OAuthProfileInput,
      this.buildMeta(req, ip),
    );
    this.redirectWithTokens(res, result);
  }

  private buildMeta(req: Request, ip: string): RequestMeta {
    const userAgent = req.headers["user-agent"];
    return {
      ipAddress: ip,
      userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
    };
  }

  // Tokens travel in the URL fragment (not the query string) so they never
  // land in server access logs or get forwarded via the Referer header.
  // The frontend callback page reads window.location.hash and clears it immediately.
  private redirectWithTokens(res: Response, result: AuthResult): void {
    const appUrl = this.config.get<string>("appUrl");
    const fragment = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }).toString();

    res.redirect(`${appUrl}/auth/callback#${fragment}`);
  }
}
