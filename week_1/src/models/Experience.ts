import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Experience extends Model {
  public id!: string;
  public name!: string;
  public description!: string;
  public type!: string;
  public price!: number;
  public currency!: string;
  public destination_id!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Experience.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    destination_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Experience',
    tableName: 'experiences',
    timestamps: true,
    underscored: true,
  }
);

export default Experience;