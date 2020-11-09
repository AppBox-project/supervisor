import { Mongoose } from "mongoose";

// Model types
export interface ModelType {
  key: string;
  name: string;
  name_plural: string;
  icon: string;
  app: string;
  primary: string;
  fields: { [name: string]: ModelFieldType };
  overviews: [ModelOverviewType];
  layouts: any;
  actions: any;
  api?: {
    read?: ModelApiType;
    create?: ModelApiType;
    modifyOwn?: ModelApiType;
    write?: ModelApiType;
    deleteOwn?: ModelApiType;
    delete?: ModelApiType;
  };
  extensions?: { [key: string]: {} };
  permissions: {
    read: string[];
    create: string[];
    delete: string[];
    modifyOwn: string[];
    write: string[];
    deleteOwn: string[];
    archive: string[];
    archiveOwn: string[];
  };
  _id: any;
}

export interface ModelFieldType {
  name: string;
  required: boolean;
  unique: boolean;
  validations: [string];
  transformations: [string];
  type?: string;
  typeArgs?: {
    type?: string;
    relationshipTo?: string;
    options?: { label: string; value: string }[];
  };
}

export interface ModelOverviewType {
  fields: string[];
  buttons: string[];
  actions: string[];
}
interface ModelApiType {
  active: boolean;
  endpoint?: string;
  authentication?: "none" | "user";
}

// Object
export interface ObjectType {
  _id: string;
  objectId: string;
  data: {};
}

// System
export interface AppBoxData {
  objects: {
    model;
    stream;
    listeners: {};
  };
  models: {
    model;
    stream;
    listeners: {};
  };
  apppermissions: {
    model;
  };
  usersettings: {
    model;
    stream;
    listeners: {};
  };
}

export interface SocketInfoType {
  listeners: any[];
  permissions: [string];
  username: string;
  user: UserType;
  identified: boolean;
}

export interface UserType {
  _id: string;
  data: {
    username: string;
  };
}

// Supervisorspecific