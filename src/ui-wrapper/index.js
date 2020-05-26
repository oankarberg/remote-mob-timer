import { Button } from "react-bootstrap";
import styled, { css } from "styled-components";

export {
  Container,
  Row,
  Col,
  FormControl,
  InputGroup,
  FormGroup,
  Spinner,
  Modal,
  Image,
} from "react-bootstrap";

const B = styled(Button)`
  ${(props) =>
    props.rounded &&
    css`
      border-radius: 20px;
    `}
`;
//   ${props =>
//     props.variant &&
//     props.variant === "primary" &&
//     css`
//       background-color: ${props.theme.primary.main};
//       border: 1px solid ${props.theme.primary.main};
//       &:hover {
//         background-color: ${props.theme.primary.dark};
//         border: 1px solid ${props.theme.primary.dark};
//       }
//     `}
// `;
export { B as Button };
