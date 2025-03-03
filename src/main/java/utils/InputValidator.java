package utils;

public class InputValidator {
    public static boolean checkX(double x) {
        return x < -4 || x > 4;
    }

    public static boolean checkY(double y) {
        return y < -5 || y > 5;
    }

    public static boolean checkR(double r) {
        return r < 1 || r > 5;
    }

    public static boolean checkHit(double x, double y, double R) {
        //rect
        if (x <= 0 && y <= 0) {
            if(!(y >= -R/2 && x >= -R)){
                return false;
            }
        }
        //circle
        else if (x >= 0 && y <= 0){
            if (!(Math.sqrt(x * x + y * y) <= R / 2)) {
                return false;
            }
        }
        //triangle
        else if (x >= 0 && y >= 0 ) {
            if (!((-(2 * x) + R) >= y)) {
                return false;
            }
        }

        else{
            return false;
        }

        return true;
    }
}