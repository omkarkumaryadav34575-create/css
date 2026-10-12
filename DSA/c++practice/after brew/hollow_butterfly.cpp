#include <iostream>
using namespace std;

int main(){
    int n;
    cin >> n;

    // upper half
    for(int row=1; row<=n; row++){

        // left wing
        for(int star=1; star<=row; star++){
            if(star==1 || star==row){
                cout<<"*";
            }
            else{
                cout<<" ";
            }
        }

        // middle space
        for(int space=1; space<=2*(n-row); space++){
            cout<<" ";
        }

        // right wing
        for(int star=1; star<=row; star++){
            if(star==1 || star==row){
                cout<<"*";
            }
            else{
                cout<<" ";
            }
        }

        cout<<endl;
    }

    // lower half
    for(int row=n-1; row>=1; row--){

        // left wing
        for(int star=1; star<=row; star++){
            if(star==1 || star==row){
                cout<<"*";
            }
            else{
                cout<<" ";
            }
        }

        // middle space
        for(int space=1; space<=2*(n-row); space++){
            cout<<" ";
        }

        // right wing
        for(int star=1; star<=row; star++){
            if(star==1 || star==row){
                cout<<"*";
            }
            else{
                cout<<" ";
            }
        }

        cout<<endl;
    }

    return 0;
}