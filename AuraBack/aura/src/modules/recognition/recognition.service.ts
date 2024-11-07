import { HttpService } from '@nestjs/axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';

@Injectable()
export class RecognitionService {

    constructor(private readonly httpService: HttpService) {}

    async recognizeFaces(aulaCode: string): Promise<any> {
        try {
            const response = await this.httpService
                .post('http://127.0.0.1:5000/api/recognize_faces', { aula: aulaCode })
                .toPromise();

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                // Verifica si el error es de Axios y maneja según el código de estado
                if (error.response) {
                    // Errores del lado del cliente/servidor (código de estado 4xx o 5xx)
                    const statusCode = error.response.status;
                    const errorMessage = error.response.data?.message || 'Error en el servicio de reconocimiento facial';
                    
                    throw new HttpException(errorMessage, statusCode);
                } else if (error.request) {
                    // No se recibió respuesta (problema de red o de conexión)
                    throw new HttpException(
                        'Error de conexión con el microservicio de reconocimiento facial',
                        HttpStatus.SERVICE_UNAVAILABLE,
                    );
                }
            }
            // Otro tipo de errores no específicos de Axios
            throw new HttpException('Error inesperado en el reconocimiento facial', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
