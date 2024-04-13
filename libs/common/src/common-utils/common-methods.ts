import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import base64url from 'base64url';
import { randomBytes } from 'crypto';
import { SsoErrorMessages } from '../messages/sso-error-messages';
import { BadRequestException } from '@nestjs/common';
import { PlatFormName } from 'apps/authentication_service/src/utils/application-contants';

export const CommonMethods = {
  getSsoErrorMsg(code: string) {
    return `${code}:- ${SsoErrorMessages[code]}`;
  },

  getOtp(): string {
    if (process.env.ENV === 'dev') {
      return '1234';
    }
    return parseInt(randomBytes(6).toString('hex'), 16).toString().substr(0, 4);
  },

  async matchPasswordHash(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  },

  async groupItemsByField(items: any[], fieldName: string) {
    const groupedItems = {};

    for (const item of items) {
      if (!(fieldName in item)) {
        throw new BadRequestException('ERROR');
      }
      const fieldValue = item[fieldName];

      if (groupedItems[fieldValue]) {
        groupedItems[fieldValue].push(item);
      } else {
        groupedItems[fieldValue] = [item];
      }
    }
    return groupedItems;
  },
  async encodePassword(password: string) {
    return await bcrypt.hash(password, 10);
  },
  verifyPlatformIsActive(user, platform: string): boolean {
    if (platform == PlatFormName.DXP) {
      return (
        user['isActive'] && user['application']['dxp']['dxpAdmin']['isActive']
      );
    }

    return true;
  },
  async generateCodeChallenge(code_verifier: string) {
    const base64Digest = createHash('sha256')
      .update(code_verifier)
      .digest('base64');

    return base64url.fromBase64(base64Digest);
  },
  async generateAuthorizationCode(str: string) {
    return createHash('sha256')
      .update(Date.now() + str)
      .digest('hex');
  },

  getKeyReplacedString(aString: string, objMap: object) {
    for (const [key, value] of Object.entries(objMap)) {
      aString = aString.replace('$' + `{${key}}`, value);
    }

    return aString;
  },
};
