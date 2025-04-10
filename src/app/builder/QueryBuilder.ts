/* eslint-disable @typescript-eslint/no-unused-vars */
import { FilterQuery, Query } from "mongoose";

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm;
    if (searchTerm) {
      const searchConditions = searchableFields.map((field) => {
        if (field.includes(".")) {
          const [parent, child] = field.split(".");
          return {
            [parent]: { [child]: { $regex: searchTerm, $options: "i" } },
          };
        } else {
          return { [field]: { $regex: searchTerm, $options: "i" } };
        }
      });

      this.modelQuery = this.modelQuery.find({ $or: searchConditions });
    }
    return this;
  }

  filter() {
    try {
      const queryObj = { ...this.query };

      // Filtering
      const excludeFields = ["searchTerm", "sort", "limit", "page", "fields"];
      excludeFields.forEach((el) => delete queryObj[el]);

      // Advanced filtering for range queries
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );

      this.modelQuery = this.modelQuery.find(
        JSON.parse(queryStr) as FilterQuery<T>
      );
    } catch (err) {
      throw new Error("Invalid filter parameters");
    }

    return this;
  }

  sort() {
    const sort =
      (this?.query?.sort as string)?.split(",")?.join(" ") || "-createdAt";

    if (sort.includes("name")) {
      this.modelQuery = this.modelQuery
        .collation({ locale: "en", strength: 2 })
        .sort(sort);
    } else {
      this.modelQuery = this.modelQuery.sort(sort);
    }

    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(",")?.join(" ") || "-__v";

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
      nextPage: page < totalPage ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };
  }
}

export default QueryBuilder;