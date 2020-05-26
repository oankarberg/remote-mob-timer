/* eslint-disable react/no-array-index-key */
import React from "react";
import PropTypes from "prop-types";
import { Button, Col, Row } from "../ui-wrapper";

const ParticipantList = ({ participants, onSelect, onRemove, variant }) => {
  return (
    <Row noGutters style={{ minHeight: "45px" }} className="h-50 px-2 px-sm-0">
      {participants.map((participant, index) => {
        const buttonVariant = participant.typist
          ? variant
          : `outline-${variant}`;
        return (
          <Col key={participant.name + index} xs="auto" className="px-1 my-1">
            <Button
              rounded="true"
              onClick={() => onSelect(participants, index, participant)}
              variant={buttonVariant}
              style={{ paddingRight: 5 }}
            >
              {participant.name}{" "}
              <span
                className="remove-cross"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(participants, index);
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                }}
                role="button"
                tabIndex={0}
                style={{
                  marginLeft: "10px",
                  paddingRight: "5px",
                  paddingLeft: "5px",
                  fontSize: "1.35rem",
                  float: "right",
                  lineHeight: "1",
                }}
              >
                <span
                  style={{
                    lineHeight: "1",
                  }}
                >
                  ×
                </span>
              </span>
            </Button>{" "}
          </Col>
        );
      })}
    </Row>
  );
};

ParticipantList.defaultProps = {
  variant: "primary",
};
ParticipantList.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  variant: PropTypes.string,
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      typist: PropTypes.bool,
    })
  ).isRequired,
};

export { ParticipantList };
