export default {
  generate(name: string) {
    if (name) {
      const slug = name.split(' ').join('-').toLowerCase();
      return slug;
    }

    return '';
  },
};
