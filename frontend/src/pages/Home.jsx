import React, { useState, useEffect } from "react";
import { Container, Typography } from "@mui/material";
import yaml from "js-yaml";
import axios from "axios";

function Home() {
  const [content, setContent] = useState({ title: "", description: "" });

  useEffect(() => {
    axios
      .get("/description.yaml")
      .then((response) => {
        const data = yaml.load(response.data);
        setContent(data);
      })
      .catch((error) =>
        console.error("Error loading the YAML content:", error),
      );
  }, []);

  return (
    <Container component="main" maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom>
        {content.title}
      </Typography>
      <Typography variant="body1">{content.description}</Typography>
    </Container>
  );
}

export default Home;
