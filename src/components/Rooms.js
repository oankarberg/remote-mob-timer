import React from "react";

import { useSelector } from "react-redux";
import { useFirebaseConnect, isLoaded, isEmpty } from "react-redux-firebase";
import { Container, Row, Col, Spinner } from "../ui-wrapper";

export const Rooms = () => {
  useFirebaseConnect([
    "rooms", // { path: '/rooms' } // object notation
  ]);

  const rooms = useSelector((state) => state.firebase.ordered.rooms);

  const renderLoading = () => {
    if (!isLoaded(rooms)) {
      return (
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      );
    }

    if (isEmpty(rooms)) {
      return <div>No Rooms yet</div>;
    }
    return null;
  };

  const renderRooms = rooms || [];

  return (
    <Container style={{ textAlign: "center" }}>
      <Row>
        <Col>
          <h1>Rooms</h1>
        </Col>
      </Row>
      {renderLoading()}
      {renderRooms.map((room) => (
        <Row key={room.key}>
          <Col>
            <h3>
              <a href={`/${room.key.substring(1, room.key.length)}`}>
                {room.value.name}
              </a>
            </h3>
          </Col>
        </Row>
      ))}
    </Container>
  );
};
