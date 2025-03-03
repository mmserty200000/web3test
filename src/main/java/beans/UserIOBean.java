package beans;


import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.SessionScoped;
import jakarta.faces.application.FacesMessage;
import jakarta.faces.context.FacesContext;
import jakarta.inject.Named;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Arrays;
import java.util.List;

import org.primefaces.PrimeFaces;

import entity.Point;

@Named
@SessionScoped

public class UserIOBean implements Serializable {
    @Getter
    @Setter
    private String xValue;

    @Getter
    @Setter
    private String yValue;

    @Getter
    @Setter
    private String rValue;


    @PostConstruct
    public void init() {
        xValue = "";
        yValue = "";
        rValue = "";
        System.out.println("UserIOBean kek");
    }
    public void sendPoint() {
        System.out.println("UserIOBean kek");
    }
    /* 
        FacesContext context = FacesContext.getCurrentInstance();
        double x, y, r;

        try {
            x = xValue;
            y = Double.parseDouble(yValue);
            r = Double.parseDouble(rValue);
        } catch (NumberFormatException e) {
            context.addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, "Input сonverting error", null));
            return;
        }

        Point point = new Point(x, y, r, System.nanoTime());

        PrimeFaces.current().executeScript(String.format("addPoint(%f, %f, %f, %b);", x, y, r, point.isSucces()));
    }
*/

}