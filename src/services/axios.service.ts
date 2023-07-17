import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosInstance, AxiosRequestConfig } from 'axios';

@Injectable()
export class AxiosService {

    axiosRef: AxiosInstance;
    constructor(private readonly httpService: HttpService){
        this.axiosRef = this.httpService.axiosRef
    }

    async asyncGet(url: string, config: AxiosRequestConfig) {
        return await new Promise((r) => {
            this.axiosRef.get(url, config).then(
                d => r(d.data)
            ).catch(
                e => r(e.response?.data || e.response || e)
            )
        });
    }

    async asyncPost(url: string, data: any, config: AxiosRequestConfig) {
        return await new Promise((r) => {
            this.axiosRef.post(url, data, config).then(
                d => r(d.data)
            ).catch(
                e => r(e.response?.data || e.response || e)
            )
        });
    }
}
