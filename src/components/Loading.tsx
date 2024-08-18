import { FC } from "react";
import styled from "styled-components";
import Lottie from "lottie-react";
import LoadingAnimation from "../../public/loading.json";

const Container = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(
    to bottom right,
    #f43f5e,
    #dc2626,
    #000000
  );
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LottieContainer = styled.div`
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Loading: FC = () => {
  return (
    <Container>
      <LottieContainer>
        <Lottie animationData={LoadingAnimation} width={100} height={100} />
      </LottieContainer>
    </Container>
  )
}

export default Loading;