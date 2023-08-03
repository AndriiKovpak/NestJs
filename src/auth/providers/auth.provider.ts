import bcrypt from 'bcrypt';

export class AuthProvider {
  static saltRound = 10;

  static async generateHash(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.saltRound);
      const hash = await bcrypt.hash(password, salt);
      console.log('===========> hash <===========: ', hash);
      return hash;
    } catch (error) {
      console.log('Hashing process has an error');
    }
    return '';
  }

  static async compare(password: string, encrypted: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, encrypted);
    } catch (error) {
      console.log('Compare process has an error');
    }
    return false;
  }
}
