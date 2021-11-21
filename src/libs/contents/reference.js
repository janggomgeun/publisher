export class Reference {
  constructor(id, type, source) {
    this.id = id;
    this.type = type;
    this.source = source;
  }

  static create(name, type, source) {
    const id = `ref_${type}_${name}`;
    return new Reference(id, type, source);
  }
}
