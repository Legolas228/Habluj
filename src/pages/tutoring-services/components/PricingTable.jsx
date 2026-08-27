import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PricingTable = ({ packages, onSelectPackage }) => {
  return (
    <div className="bg-white rounded-xl shadow-soft border overflow-hidden">
      <div className="bg-gradient-cultural p-5 text-center sm:p-6">
        <h3 className="text-xl font-headlines font-bold text-white mb-2 sm:text-2xl">
          Porovnanie balíčkov
        </h3>
        <p className="text-white/90">
          Vyberte si balíček, ktorý najlepšie vyhovuje Vašim potrebám
        </p>
      </div>
      <div className="space-y-4 p-4 md:hidden">
        {packages?.map((pkg) => (
          <article key={pkg?.id} className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${pkg?.color}`}>
                <Icon name={pkg?.icon} size={18} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-headlines font-bold text-foreground">{pkg?.name}</h4>
                <p className="text-sm text-muted-foreground">{pkg?.subtitle}</p>
                <p className="mt-2 text-xl font-bold text-foreground">{pkg?.price}</p>
                <p className="text-sm text-muted-foreground">{pkg?.period}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 border-t border-border pt-4">
              {pkg?.features?.map((feature, index) => (
                <li key={`${pkg?.id}-${index}`} className="flex items-start gap-2 text-sm text-foreground">
                  <Icon name={feature?.included ? 'Check' : 'X'} size={16} className={feature?.included ? 'mt-0.5 shrink-0 text-success' : 'mt-0.5 shrink-0 text-muted-foreground'} />
                  <span>{feature?.name || feature?.value}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={pkg?.popular ? 'default' : 'outline'}
              fullWidth
              onClick={() => onSelectPackage(pkg?.id)}
              className={pkg?.popular ? 'mt-4 bg-primary hover:bg-primary/90' : 'mt-4'}
            >
              {pkg?.popular ? 'Začať teraz' : 'Vybrať balíček'}
            </Button>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium text-foreground">Funkcie</th>
              {packages?.map((pkg) => (
                <th key={pkg?.id} className="text-center p-4 min-w-[200px]">
                  <div className="space-y-2">
                    <div className={`w-12 h-12 rounded-lg mx-auto flex items-center justify-center ${pkg?.color}`}>
                      <Icon name={pkg?.icon} size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-headlines font-bold text-foreground">{pkg?.name}</h4>
                      <p className="text-sm text-muted-foreground">{pkg?.subtitle}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{pkg?.price}</div>
                      <div className="text-sm text-muted-foreground">{pkg?.period}</div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {packages?.[0]?.features?.map((feature, index) => (
              <tr key={index} className="border-b border-border hover:bg-muted/50">
                <td className="p-4 font-medium text-foreground">{feature?.name}</td>
                {packages?.map((pkg) => (
                  <td key={pkg?.id} className="p-4 text-center">
                    {pkg?.features?.[index]?.included ? (
                      pkg?.features?.[index]?.value ? (
                        <span className="text-foreground font-medium">
                          {pkg?.features?.[index]?.value}
                        </span>
                      ) : (
                        <Icon name="Check" size={20} className="text-success mx-auto" />
                      )
                    ) : (
                      <Icon name="X" size={20} className="text-muted-foreground mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-4"></td>
              {packages?.map((pkg) => (
                <td key={pkg?.id} className="p-4">
                  <Button
                    variant={pkg?.popular ? "default" : "outline"}
                    fullWidth
                    onClick={() => onSelectPackage(pkg?.id)}
                    className={pkg?.popular ? "bg-primary hover:bg-primary/90" : ""}
                  >
                    {pkg?.popular ? "Začať teraz" : "Vybrať balíček"}
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PricingTable;
