import React from "react";
import { CreateRoom } from "../components/CreateRoom";
import { Col, Container, Row, Image } from "../ui-wrapper";

import logo from "../assets/github/logo-32.png";

const Main = () => {
  return (
    <Container className="h-100 d-flex flex-column justify-content-around">
      <div className="text-center">
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

      <div style={{ textAlign: "center" }}>
        <a
          href="https://github.com/oankarberg/remote-mob-timer"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src={logo} width={24} rounded />
          <div className="py-2" style={{ fontSize: "12px" }}>
            Source Code
          </div>
        </a>
      </div>
    </Container>
  );
};

export { Main };
