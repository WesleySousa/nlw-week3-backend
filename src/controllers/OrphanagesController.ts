import { Request, Response } from 'express';

import { getRepository  } from 'typeorm';
import Orphanage from './../models/Orphanage';
import orphanages_view from './../views/orphanages_view';
import orphanageView  from './../views/orphanages_view';

import * as Yup from 'yup';

export default class OrphanagesController {

  static async index(request: Request, response: Response) {
    const orphanagesRepository = getRepository(Orphanage);
    const orphanages = await orphanagesRepository.find({
      relations: ['images']
    });
    return response.json(orphanageView.renderMany(orphanages));
  }

  static async show(request: Request, response: Response) {
    const { id } = request.params;
    const orphanagesRepository = getRepository(Orphanage);
    const orphanages = await orphanagesRepository.findOneOrFail(id);
    return response.json(orphanages_view.render(orphanages));
  }

  static async create(request: Request, response: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends
    } = request.body;
    const orphanagesRepository = getRepository(Orphanage);

    const requestImages = request.files as Express.Multer.File[];

    const images = requestImages.map(image => { 
      return { path: image.filename }
    });

    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      images
    };

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome é obrigatório'),
      latitude: Yup.number().required('Latitude é obrigatório'),
      longitude: Yup.number().required('Longitude é obrigatório'),
      about: Yup.string().required('Sobre é obrigatório').max(300),
      instructions: Yup.string().required('Instruções é obrigatório'),
      opening_hours: Yup.string().required(''),
      open_on_weekends: Yup.boolean().required(),
      images: Yup.array(Yup.object().shape({
        path: Yup.string().required()
      })),
    });

    await schema.validate(data, {
      abortEarly: false,
    });

    const orphanage = orphanagesRepository.create(data);
    await orphanagesRepository.save(orphanage);
    return response.status(201).send(orphanage);
  }
}