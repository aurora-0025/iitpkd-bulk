import { InferType, number, object, string } from "yup";

const schema = object().shape({
  "Target Program Name": string().required(),
  Semester: number().typeError("Expected a number").required(),
  "Course Type": string().required(),
  "Course Code": string().required(),
  "Course Name": string().required(),
  Credits: string()
    .matches(/^\d-\d-\d-\d$/, "Expected like 3-0-0-3")
    .required(),
  Coordinator: string().required(),
  Slot: string().required(),
  Room: string().required(),
  Batches: string().required(),
  "Offering Department": string().required(),
  Quota: string().required(),
  Strength: number().required()
});

export const tableHeaders = Object.keys(schema.fields);

schema.shape({
  status: string().oneOf(["LOADING", "SUCCESS", "WARNING"]).notRequired(),
  statusText: object().notRequired(),
});

export type Course = InferType<typeof schema> & { [key: string]: any };
export default schema;
