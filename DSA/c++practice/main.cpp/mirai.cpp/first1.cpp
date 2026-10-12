#include <iostream>
using namespace std;
int main(){
    int total_cost;
    cout<<"enter total cost"<<endl;
    cin>>total_cost;
    cout<<"total cost of your purchase is :"<<total_cost<<endl;
    if (total_cost>1000){
        int after_discount=total_cost/100*10;
        cout<<"your total cost after discount is : "<<after_discount<<endl;
    }
    return 0;
}