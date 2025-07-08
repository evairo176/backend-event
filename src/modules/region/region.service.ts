import { db } from '../../database/database';

export default class RegionService {
  public async findByCity(name: string) {
    const result = db.regency.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      //   include: {
      //     province: true,
      //     districts: {
      //       include: {
      //         villages: true,
      //       },
      //     },
      //   },
    });
    return result;
  }

  public async getAllProvinces() {
    const result = db.province.findMany({
      include: {
        regencies: true,
      },
    });
    return result;
  }

  public async getProvince(code: string) {
    const result = db.province.findFirst({
      where: { code },
      include: {
        regencies: {
          include: {
            districts: {
              include: {
                villages: true,
              },
            },
          },
        },
      },
    });
    return result;
  }

  public async getRegency(code: string) {
    const result = db.regency.findFirst({
      where: { code },
    });
    return result;
  }

  public async getDistrict(code: string) {
    const result = db.district.findFirst({
      where: { code },
      include: {
        regency: {
          include: {
            province: true,
          },
        },
        villages: true,
      },
    });
    return result;
  }

  public async getVillage(code: string) {
    const result = db.village.findFirst({
      where: { code },
      include: {
        district: {
          include: {
            regency: {
              include: {
                province: true,
              },
            },
          },
        },
      },
    });
    return result;
  }
}
