import crypto from 'crypto';

class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.data = new Map();
  }

  generateId() {
    return crypto.randomBytes(12).toString('hex');
  }

  async create(doc) {
    const id = doc._id || this.generateId();
    const now = new Date();
    const item = {
      ...doc,
      _id: id,
      id: id,
      createdAt: doc.createdAt || now,
      updatedAt: doc.updatedAt || now
    };
    this.data.set(id.toString(), item);
    return this._wrapDoc(item);
  }

  _wrapDoc(raw) {
    if (!raw) return null;
    const self = this;
    const doc = { ...raw };
    doc.save = async function() {
      doc.updatedAt = new Date();
      self.data.set(doc._id.toString(), { ...doc });
      return self._wrapDoc(doc);
    };
    return doc;
  }

  find(filter = {}) {
    return new QueryBuilder(this, filter);
  }

  findOne(filter = {}) {
    return new QueryBuilder(this, filter, true);
  }

  findById(id) {
    return new QueryBuilder(this, { _id: id }, true);
  }

  findByIdAndUpdate(id, update, options = {}) {
    const self = this;
    const p = (async () => {
      if (!id) return null;
      const existing = self.data.get(id.toString());
      if (!existing) return null;
      
      let updated;
      if (update.$set) {
        updated = { ...existing, ...update.$set, updatedAt: new Date() };
      } else {
        updated = { ...existing, ...update, updatedAt: new Date() };
      }
      self.data.set(id.toString(), updated);
      return self._wrapDoc(updated);
    })();

    p.populate = function() { return p; };
    p.select = function() { return p; };
    return p;
  }

  async findByIdAndDelete(id) {
    if (!id) return null;
    const existing = this.data.get(id.toString());
    if (existing) {
      this.data.delete(id.toString());
      return this._wrapDoc(existing);
    }
    return null;
  }

  async countDocuments(filter = {}) {
    const q = new QueryBuilder(this, filter);
    const results = await q.exec();
    return results.length;
  }
}

class QueryBuilder {
  constructor(collection, filter = {}, single = false) {
    this.collection = collection;
    this.filter = filter;
    this.single = single;
    this._sort = null;
    this._skip = 0;
    this._limit = null;
    this._populates = [];
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  skip(n) {
    this._skip = Number(n) || 0;
    return this;
  }

  limit(n) {
    this._limit = Number(n);
    return this;
  }

  populate(field, select) {
    this._populates.push({ field, select });
    return this;
  }

  select() {
    return this;
  }

  async exec() {
    const all = Array.from(this.collection.data.values());
    let filtered = all.filter(item => {
      // Check top-level $or
      if (this.filter.$or && Array.isArray(this.filter.$or)) {
        const matchesOr = this.filter.$or.some(condition => {
          for (const [key, val] of Object.entries(condition)) {
            if (val && typeof val === 'object' && val.$regex) {
              const reg = new RegExp(val.$regex, val.$options || 'i');
              if (reg.test(item[key] || '')) return true;
            } else if (item[key] === val) {
              return true;
            }
          }
          return false;
        });
        if (!matchesOr) return false;
      }

      for (const [key, val] of Object.entries(this.filter)) {
        if (key === '$or') continue;
        if (key === '_id' || key === 'id') {
          if (item._id?.toString() !== val?.toString()) return false;
        } else if (val && typeof val === 'object' && val.$in) {
          if (!val.$in.includes(item[key])) return false;
        } else if (val && typeof val === 'object' && val.$regex) {
          const reg = new RegExp(val.$regex, val.$options || 'i');
          if (!reg.test(item[key] || '')) return false;
        } else if (val && typeof val === 'object' && (val.$gte || val.$lte)) {
          const itemVal = new Date(item[key]);
          if (val.$gte && itemVal < new Date(val.$gte)) return false;
          if (val.$lte && itemVal > new Date(val.$lte)) return false;
        } else if (item[key] !== val) {
          return false;
        }
      }
      return true;
    });

    if (this._sort) {
      const [sortField, sortOrder] = Object.entries(this._sort)[0] || [];
      if (sortField) {
        filtered.sort((a, b) => {
          let va = a[sortField];
          let vb = b[sortField];
          if (va instanceof Date || vb instanceof Date || !isNaN(Date.parse(va))) {
            va = new Date(va).getTime();
            vb = new Date(vb).getTime();
          }
          if (va < vb) return sortOrder === -1 || sortOrder === 'desc' ? 1 : -1;
          if (va > vb) return sortOrder === -1 || sortOrder === 'desc' ? -1 : 1;
          return 0;
        });
      }
    }

    if (this._skip) {
      filtered = filtered.slice(this._skip);
    }
    if (this._limit) {
      filtered = filtered.slice(0, this._limit);
    }

    // Handle populates
    for (const pop of this._populates) {
      const targetCol = memoryDb[pop.field === 'requester' || pop.field === 'assignedTo' || pop.field === 'author' || pop.field === 'user' ? 'User' : 'Request'];
      if (targetCol) {
        for (const item of filtered) {
          if (item[pop.field]) {
            const relId = typeof item[pop.field] === 'object' ? item[pop.field]._id : item[pop.field];
            const found = targetCol.data.get(relId?.toString());
            if (found) {
              item[pop.field] = { ...found };
            }
          }
        }
      }
    }

    if (this.single) {
      return filtered.length > 0 ? this.collection._wrapDoc(filtered[0]) : null;
    }
    return filtered.map(item => this.collection._wrapDoc(item));
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

export const memoryDb = {
  User: new MemoryCollection('User'),
  Request: new MemoryCollection('Request'),
  Comment: new MemoryCollection('Comment'),
  KnowledgeArticle: new MemoryCollection('KnowledgeArticle'),
  AiLog: new MemoryCollection('AiLog')
};
