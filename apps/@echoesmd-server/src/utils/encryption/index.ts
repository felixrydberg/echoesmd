
const encryptPassword = async (password: string) => {
  return await Bun.password.hash(password);
};

const comparePassword = async (password: string, hash: string) => {
  return await Bun.password.verify(password, hash);
}

export {
  encryptPassword,
  comparePassword
}
