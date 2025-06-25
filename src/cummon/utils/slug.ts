export default {
  generate(name: string) {
    const slug = name.split(' ').join('-').toLowerCase();

    return slug;
  },
};
