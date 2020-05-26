import React, { useRef } from "react";
import PropTypes from "prop-types";
import { Button, Col, Container, Modal, Row } from "../ui-wrapper";

export const VerticallyCenteredModal = ({
  show,
  onHide,
  message,
  ...props
}) => {
  const buttonRef = useRef();
  const { content, header } = message;
  return (
    <Modal
      {...props}
      onHide={() => {}}
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Container className="p-5">
        <Row className="justify-content-center">
          <Col xs="auto">
            <Modal.Title id="contained-modal-title-vcenter">
              {header}
            </Modal.Title>
          </Col>
        </Row>
        <Row className="justify-content-center pt-4">
          <Col>
            <h1 style={{ fontSize: "50px", textAlign: "center" }}>{content}</h1>
          </Col>
        </Row>
        <Row className="justify-content-center pt-4">
          <Col>
            <Button ref={buttonRef} block onClick={onHide}>
              OK
            </Button>
          </Col>
        </Row>
      </Container>
    </Modal>
  );
};
VerticallyCenteredModal.defaultProps = {
  message: null,
};

VerticallyCenteredModal.propTypes = {
  message: PropTypes.shape({
    header: PropTypes.string,
    content: PropTypes.string,
  }),
  onHide: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};
