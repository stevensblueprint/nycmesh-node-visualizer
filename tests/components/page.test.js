import {Home} from "@/app/page";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

describe("Home", () => {
    it("renders the home page with the map", ()=>{
        render(<Home />);
    });
});

