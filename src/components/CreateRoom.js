import React, { useState } from "react";
import { Button, Col, Row, Spinner } from "react-bootstrap";
import { useFirebase } from "react-redux-firebase";
import { useHistory } from "react-router-dom";
import { Container } from "../ui-wrapper";
import { generateSampleRoom } from "../services/firebase/model";

export const generatePerson = (name, typist = false) => {
  return {
    name,
    typist,
  };
};
export const CreateRoom = () => {
  const firebase = useFirebase();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);

  const addSampleRoom = () => {
    setIsLoading(true);

    const sampleRoom = generateSampleRoom();
    firebase
      .push("rooms", sampleRoom)
      .then((d) => {
        setIsLoading(false);
        if (d.key) {
          const { key } = d;
          history.push(`/${key.substring(1)}`);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  return (
    <Container style={{ textAlign: "center" }}>
      <Row className="justify-content-center">
        <Col xs={6} md={3}>
          <Button block variant="outline-primary" onClick={addSampleRoom}>
            {!isLoading ? (
              "New Room"
            ) : (
              <Spinner
                style={{ width: "1rem", height: "1rem" }}
                animation="border"
                role="status"
              >
                <span className="sr-only">Loading...</span>
              </Spinner>
            )}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};
