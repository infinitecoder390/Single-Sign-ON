import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class RestService {
  constructor(private readonly httpService: HttpService) {}

  async get(url: string, requestConfig?: AxiosRequestConfig) {
    return await lastValueFrom(
      this.httpService.get(url, requestConfig).pipe(map((res) => res.data)),
    );
  }

  async post(url: string, data: any, requestConfig?: AxiosRequestConfig) {
    return await lastValueFrom(
      this.httpService
        .post(url, data, requestConfig)
        .pipe(map((res) => res.data)),
    );
  }
}
