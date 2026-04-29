"use client";
import React from 'react';
import { Admin, Resource, List, Datagrid, TextField, EmailField, NumberField, DateField } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

const dataProvider = simpleRestProvider('/api/v1');

const UsersList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="first_name" />
      <TextField source="last_name" />
      <EmailField source="email" />
      <TextField source="role" />
      <DateField source="created_at" />
    </Datagrid>
  </List>
);

const InternshipsList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="company_name" />
      <NumberField source="applications_count" />
      <TextField source="status" />
      <DateField source="deadline" />
    </Datagrid>
  </List>
);

const ApplicationsList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="student_name" />
      <TextField source="internship_id" />
      <DateField source="created_at" />
    </Datagrid>
  </List>
);

const ArticlesList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="author_name" />
      <TextField source="published" />
      <DateField source="created_at" />
    </Datagrid>
  </List>
);

export default function ReactAdminWrapper() {
  return (
    <div style={{ padding: 12 }}>
      <Admin dataProvider={dataProvider} disableTelemetry={true}>
        <Resource name="users" list={UsersList} />
        <Resource name="internships" list={InternshipsList} />
        <Resource name="applications" list={ApplicationsList} />
        <Resource name="articles" list={ArticlesList} />
      </Admin>
    </div>
  );
}
