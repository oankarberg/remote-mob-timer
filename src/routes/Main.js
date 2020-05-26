import React from "react";
import { CreateRoom } from "../components/CreateRoom";
import { Col, Container, Row } from "../ui-wrapper";

const Main = () => {
  return (
    <Container className="h-100 d-flex  align-items-center">
      <div className="text-center" style={{ marginTop: "-30%" }}>
        <Row className="py-3">
          <Col>
            <h1 className=""> Remote Mob</h1>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md={6}>
            <div>
              A tool to help your team with remote programming- and
              collaboration tasks. Remote mob keeps track of the current
              &quot;Typist&quot; and when to take coffee breaks through synced
              timer and browser notifications. Get started by creating a new
              room or joining through a link.
            </div>
          </Col>
        </Row>
        <Row className="py-4">
          <CreateRoom />
        </Row>
      </div>
    </Container>
  );
};

export { Main };
